from flask import Flask, request, jsonify
import sqlite3
import os

app = Flask(__name__)
DB_DIR = 'C:\Users\Public\Documents'  # Update with your DB directory
DB_PATH = os.path.join(DB_DIR, 'tracking_data.db')

def init_db():
  if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)
  with sqlite3.connect(DB_PATH) as conn:
    conn.execute('CREATE TABLE IF NOT EXISTS url_log (id INTEGER PRIMARY KEY, start_time TEXT, end_time TEXT, url TEXT)')  # Updated table schema
    conn.commit()

@app.route('/save', methods=['POST'])
def save_data():
  data = request.json  # Expecting a JSON object now
  print(data)
  # Validate required fields
  if not all(field in data for field in ('startTime', 'endTime', 'url')):
    return jsonify({'error': 'Missing required fields (startTime, endTime, url)'}), 400

  # Extract individual values
  start_time = data['startTime']
  end_time = data['endTime']
  url = data['url']
  print(data)
  with sqlite3.connect(DB_PATH) as conn:
    cursor = conn.cursor()
    cursor.execute('INSERT INTO url_log (start_time, end_time, url) VALUES (?, ?, ?)', (start_time, end_time, url))
    conn.commit()
    # Print for debugging if needed
    # print(f"Saved data: start_time: {start_time}, end_time: {end_time}, url: {url}")  # Optional

    return jsonify({'message': 'Data saved successfully', 'id': cursor.lastrowid})

if __name__ == '__main__':
  init_db()
  app.run(host='0.0.0.0', port=5000)
