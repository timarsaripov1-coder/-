from flask import Flask, jsonify
import os, datetime

app = Flask(__name__)

@app.route('/')
def index():
    return 'OK — repl is alive'

@app.route('/health')
def health():
    return jsonify(status='ok', time=datetime.datetime.utcnow().isoformat()+'Z')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
