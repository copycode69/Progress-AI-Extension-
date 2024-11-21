from flask import Flask, request, jsonify
import os
import logging
from dotenv import load_dotenv
import cohere  # Import the Cohere library
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# Check and initialize Cohere client with your API key
cohere_api_key = os.getenv("COHERE_API_KEY")
if not cohere_api_key:
    logging.error("Cohere API key is not set. Please add it to the .env file.")
    raise ValueError("Cohere API key not found")

# Initialize the Cohere client
co = cohere.Client(cohere_api_key)

@app.route('/chat', methods=['POST'])
def chat():
    # Get the user input from the JSON request
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({'error': 'No input provided'}), 400

    logging.debug(f'Received input: {user_input}')

    # Define a list of models to try in order
    model_list = ["command-xlarge", "command-medium", "command-light"]  # Replace with models available to you

    response = None
    for model in model_list:
        try:
            logging.debug(f"Trying model: {model}")
            response = co.generate(
                model=model,
                prompt=user_input,
                max_tokens=150  # Adjust max tokens as per your requirements
            )
            break  # Exit the loop if a model is successfully used
        except cohere.errors.NotFoundError:
            logging.warning(f"Model '{model}' not found. Trying the next model.")
        except Exception as e:
            logging.error(f"An unexpected error occurred with model '{model}': {e}")
            return jsonify({'error': str(e)}), 500
    
    # Check if no models succeeded
    if response is None:
        return jsonify({'error': 'No valid model found. Please check model access or availability.'}), 500

    # Extract generated text from the successful response
    reply = response.generations[0].text.strip()
    
    if not reply:
        logging.error('Generated text is empty')
        return jsonify({'error': 'No reply generated from Cohere model'}), 500

    return jsonify({'reply': reply})

if __name__ == '__main__':
    # Use a specific host and port if needed, defaults to 127.0.0.1:5000
    app.run(debug=True)
