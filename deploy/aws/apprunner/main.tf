# Promptfolio on AWS App Runner from an ECR image. See docs/deploy/aws.md.
#   terraform init && terraform apply -var image=<account>.dkr.ecr.<region>.amazonaws.com/promptfolio:main
# Not exercised by the template's CI; run `terraform validate` and `plan`.
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 5.0" }
  }
}

variable "region" {
  type    = string
  default = "us-east-1"
}
variable "image" {
  type        = string
  description = "ECR image URI (App Runner pulls private images from ECR only)"
}
variable "name" {
  type    = string
  default = "promptfolio"
}

provider "aws" { region = var.region }

# Lets App Runner pull from ECR.
resource "aws_iam_role" "ecr_access" {
  name = "${var.name}-apprunner-ecr"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "build.apprunner.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_access" {
  role       = aws_iam_role.ecr_access.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_apprunner_service" "site" {
  service_name = var.name

  source_configuration {
    auto_deployments_enabled = true
    authentication_configuration { access_role_arn = aws_iam_role.ecr_access.arn }
    image_repository {
      image_identifier      = var.image
      image_repository_type = "ECR"
      image_configuration { port = "3000" }
    }
  }

  instance_configuration {
    cpu    = "256"  # 0.25 vCPU
    memory = "512"  # 0.5 GB, the smallest App Runner allows
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/ready"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 3
  }
}

output "url" { value = "https://${aws_apprunner_service.site.service_url}" }
