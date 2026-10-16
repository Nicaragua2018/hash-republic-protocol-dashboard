FROM python:3.13-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY *.py ./
COPY base ./base
RUN mkdir /registros && chown nobody /registros
USER nobody
EXPOSE 8080
CMD ["python", "-u", "servidor.py"]
