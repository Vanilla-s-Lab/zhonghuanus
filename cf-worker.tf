terraform {
  cloud {
    organization = "Vanilla-s-Lab"

    workspaces {
      name = "zhonghuanus"
    }
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 3.0"
    }
  }
}
