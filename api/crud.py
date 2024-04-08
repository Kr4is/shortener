import os
from supabase import create_client, Client
from . import keygen

supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(supabase_url, supabase_key)

def create_url(url: str) -> str:

    secret_key = secret_key_from_existing_url(url)

    if not secret_key:
        key = keygen.create_unique_random_key()
        secret_key = f"{key}_{keygen.create_random_key(length=8)}"
        print(f"adding : {secret_key}")
        #supabase.table('shorts').insert({"id": key, "secret_key": secret_key, "original_url": url}).execute()

    return secret_key

def get_url_by_key(url_key: str) -> str:
    
    response = supabase.table('shorts').select('original_url').eq('secret_key', url_key).execute()
    if response.data:
        print(response.data)
        return response.data[0]['original_url']

    return None

def secret_key_from_existing_url(url: str) -> str:
    
    response = supabase.table('shorts').select('secret_key').eq('original_url', url).execute()

    if response.data:
        return response.data[0]['secret_key']
    
    return None