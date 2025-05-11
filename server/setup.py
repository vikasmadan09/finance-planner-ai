from setuptools import setup, find_packages

setup(
    name="finance-planner-ai",
    version="0.1.0",
    packages=find_packages(include=["app","app.*"]),
    install_requires=[
        line.strip() for line in open("requirements.txt")
        if line and not line.startswith("#")
    ],
    entry_points={
        "console_scripts":[
            "start-server=app.main:run", # requires a `run()` method in app/main.py
        ]
    }
)