FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
RUN python -m nltk.downloader punkt vader_lexicon

COPY . .

EXPOSE 8080

CMD ["python", "app.py"]
