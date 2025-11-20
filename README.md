# Care-AI
An integrated health co-pilot using AI.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AhmedAl-Mahdi/test.git
cd test
```

2. Install required Python packages:
```bash
pip install -r requirements.txt
```

3. Configure Streamlit secrets:
   - Copy `.streamlit/secrets.toml.example` to `.streamlit/secrets.toml`
   - Fill in your Supabase credentials in `.streamlit/secrets.toml`
   - Get your credentials from your Supabase project settings

4. Run the application:
```bash
streamlit run 0_Home.py
```

### Deployment to Streamlit Cloud

1. Push your code to GitHub
2. Go to [Streamlit Cloud](https://share.streamlit.io/)
3. Connect your GitHub repository
4. Add your secrets in the Streamlit Cloud dashboard:
   - Go to your app settings
   - Add `SUPABASE_URL` and `SUPABASE_KEY` in the Secrets section

## Troubleshooting

### ModuleNotFoundError: No module named 'supabase'

If you encounter this error:
1. Make sure you've installed all dependencies: `pip install -r requirements.txt`
2. If deploying to Streamlit Cloud, ensure the `requirements.txt` file is in the root directory
3. Check that your Python environment is activated

### Configuration Issues

- Ensure `.streamlit/secrets.toml` exists and contains your Supabase credentials
- The `config.toml` file should be in the `.streamlit/` directory, not the root

