# Base image
FROM python:3.10-slim

# Create a non-root user and set the working directory
RUN useradd -m appuser

WORKDIR /app

COPY . .

# Set permissions for the appuser to ensure they can access the files
RUN chown -R appuser:appuser /app
# Switch to the appuser
USER appuser

RUN pip install --upgrade --user pip
RUN pip install --user -r requirements.txt
# install app as python package using setup.py
RUN pip install --user .

# Set environment variables
ENV ENVIRONMENT=production
ENV PYTHONPATH=/app
# So that start-server is found
ENV PATH=$PATH:/home/appuser/.local/bin  

EXPOSE 8000

CMD ["start-server"]