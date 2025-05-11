# Base image
FROM python:3.10-slim

WORKDIR /code
COPY . .
ENV PYTHONPATH=/code

RUN pip install --upgrade pip
RUN pip install .

EXPOSE 8000

CMD ["start-server"]