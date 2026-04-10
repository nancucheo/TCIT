variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for API origin"
  type        = string
}

variable "alb_https_enabled" {
  description = "Whether ALB has HTTPS enabled (certificate configured)"
  type        = bool
  default     = false
}
