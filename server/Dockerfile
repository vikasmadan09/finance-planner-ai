# Base image
FROM python:3.10-slim

# Create a non-root user and set the working directory
RUN useradd -m appuser

WORKDIR /app

COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
# install app as python package using setup.py
RUN pip install .

# Set environment variables
ENV ENVIRONMENT=production
ENV PYTHONPATH=/app

# Set permissions for the appuser to ensure they can access the files
RUN chown -R appuser:appuser /app
# Switch to the appuser
USER appuser

EXPOSE 8000

CMD ["start-server"]