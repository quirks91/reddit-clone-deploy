/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.gravatar.com",
      "localhost",
      "ec2-3-35-126-16.ap-northeast-2.compute.amazonaws.com",
    ]
  }
}

module.exports = nextConfig
