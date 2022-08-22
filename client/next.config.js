/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.gravatar.com",
      "localhost",
      "ec2-3-101-28-122.us-west-1.compute.amazonaws.com"
    ]
  }
}

module.exports = nextConfig
