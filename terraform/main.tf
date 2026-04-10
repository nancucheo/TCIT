terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "tcit-posts-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "tcit-posts"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# --- Modules ---

module "vpc" {
  source = "./modules/vpc"

  project            = "tcit-posts"
  environment        = var.environment
  availability_zones = ["${var.aws_region}a", "${var.aws_region}b"]
}

module "ecr" {
  source = "./modules/ecr"

  project     = "tcit-posts"
  environment = var.environment
}

module "alb" {
  source = "./modules/alb"

  project           = "tcit-posts"
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
}

module "ecs" {
  source = "./modules/ecs"

  project               = "tcit-posts"
  environment           = var.environment
  aws_region            = var.aws_region
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  alb_security_group_id = module.alb.security_group_id
  target_group_arn      = module.alb.target_group_arn
  backend_image         = var.backend_image
  database_url          = module.rds.database_url
}

module "rds" {
  source = "./modules/rds"

  project               = "tcit-posts"
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  ecs_security_group_id = module.ecs.security_group_id
  db_username           = var.db_username
  db_password           = var.db_password
}

module "cdn" {
  source = "./modules/cdn"

  project      = "tcit-posts"
  environment  = var.environment
  alb_dns_name = module.alb.dns_name
}
