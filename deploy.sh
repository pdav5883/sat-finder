aws s3 sync . s3://sat-finder-public --exclude="*" --include="*.html" --include="*.css" --include="*.js"
aws cloudfront create-invalidation --distribution-id E3J96IK4F0VX62 --paths "/*"
