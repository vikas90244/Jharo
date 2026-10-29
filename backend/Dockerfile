FROM python:3.14-alpine
RUN apk add --no-cache libstdc++

WORKDIR /app
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
CMD ["uvicorn", "config.asgi:application", "--host", "0.0.0.0", "--port", "8080"]
