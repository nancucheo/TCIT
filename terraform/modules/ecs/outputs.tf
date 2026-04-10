output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.backend.name
}

output "security_group_id" {
  description = "ECS security group ID"
  value       = aws_security_group.ecs.id
}
