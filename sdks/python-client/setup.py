from setuptools import setup

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="can20-client",
    version="0.1.12",
    author="CAN20",
    author_email="hello@chainainexus.com",
    description="A package for interacting with the CAN20 Service-API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/chainainexus/can20",
    license="MIT",
    packages=["can20_client"],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
    install_requires=["requests"],
    keywords="can20 nlp ai language-processing",
    include_package_data=True,
)
