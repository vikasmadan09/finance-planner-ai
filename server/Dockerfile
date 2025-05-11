# Base image
FROM python:3.10-slim

WORKDIR /app

COPY . .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENV PYTHONPATH=/app

RUN pip install .

EXPOSE 8000

CMD ["start-server"]