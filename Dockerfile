FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
CMD ["nginx", "-g", "daemon off;"]
