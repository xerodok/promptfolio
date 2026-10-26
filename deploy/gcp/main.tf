# Promptfolio on Google Cloud Run (scale-to-zero). See docs/deploy/gcp-cloud-run.md.
#   terraform init && terraform apply -var project=<id> -var image=<image>
# Not exercised by the template's CI; run `terraform validate` and `plan`.
terraform {
  required_version = ">= 1.5"
  required_providers {
    google = { source = "hashicorp/google", version = ">= 5.0" }
  }
}

variable "project" { type = string }
variable "region" {
  type    = string
  default = "us-central1"
}
variable "image" {
  type        = string
  description = "Container image, e.g. REGION-docker.pkg.dev/PROJECT/promptfolio/web:main or a public image"
}
variable "name" {
  type    = string
  default = "promptfolio"
}

provider "google" {
  project = var.project
  region  = var.region
}

resource "google_project_service" "run" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_cloud_run_v2_service" "site" {
  name     = var.name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }
    containers {
      image = var.image
      ports { container_port = 3000 }
      resources {
        limits = { cpu = "1", memory = "128Mi" }
        cpu_idle = true
      }
      startup_probe {
        http_get { path = "/api/ready" }
        initial_delay_seconds = 1
        period_seconds        = 2
        failure_threshold     = 15
      }
      liveness_probe {
        http_get { path = "/api/health" }
        period_seconds = 30
      }
    }
  }
  depends_on = [google_project_service.run]
}

# Public, unauthenticated access.
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.site.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "url" { value = google_cloud_run_v2_service.site.uri }
