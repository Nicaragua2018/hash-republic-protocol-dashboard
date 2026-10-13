FROM python:3.13-alpine
WORKDIR /app
COPY portero.py .
USER nobody
EXPOSE 8080
CMD ["python", "-u", "portero.py"]
