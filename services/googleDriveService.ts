// Use process.env.API_KEY directly as per guidelines
const API_KEY = process.env.API_KEY;

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

/**
 * Safely retrieves and cleans the Google Client ID from localStorage or environment.
 */
function getClientId(): string {
  const storedId = localStorage.getItem('google_client_id');
  if (storedId && typeof storedId === 'string') {
    return storedId.trim();
  }

  try {
    const envId = (process.env.GOOGLE_CLIENT_ID as string) || '';
    return envId.trim();
  } catch {
    return '';
  }
}

export async function pickFileFromDrive(): Promise<string | null> {
  const CLIENT_ID = getClientId();

  if (!CLIENT_ID) {
    throw new Error('Missing Google Client ID. Click the shield icon in settings to configure.');
  }

  if (!CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
    throw new Error('Invalid Client ID format. Check the settings guide.');
  }

  return new Promise((resolve, reject) => {
    try {
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services not loaded. Try refreshing the page.');
      }

      // Modern token client configuration
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (response: any) => {
          if (response.error !== undefined) {
            console.error('OAuth Callback Error:', response);
            reject(new Error(`OAuth Error: ${response.error_description || response.error}`));
            return;
          }
          
          const accessToken = response.access_token;
          
          if (!window.gapi) {
             reject(new Error('Google GAPI (legacy) loader not found.'));
             return;
          }

          window.gapi.load('picker', {
            callback: () => {
              try {
                const picker = new window.google.picker.PickerBuilder()
                  .addView(window.google.picker.ViewId.DOCS)
                  .setOAuthToken(accessToken)
                  .setDeveloperKey(API_KEY)
                  .setCallback(async (data: any) => {
                    if (data.action === window.google.picker.Action.PICKED) {
                      const file = data.docs[0];
                      try {
                        const content = await fetchFileContent(file.id, file.mimeType, accessToken);
                        resolve(content);
                      } catch (err) {
                        reject(err);
                      }
                    } else if (data.action === window.google.picker.Action.CANCEL) {
                      resolve(null);
                    }
                  })
                  .build();
                picker.setVisible(true);
              } catch (pickerErr: any) {
                reject(new Error(`Picker Error: ${pickerErr.message}`));
              }
            }
          });
        },
      });

      // Force consent and account selection for unverified apps
      tokenClient.requestAccessToken({ 
        prompt: 'select_account',
        hint: '', // Ensure no account hint interferes with the selection
      });
    } catch (error: any) {
      reject(error);
    }
  });
}

async function fetchFileContent(fileId: string, mimeType: string, accessToken: string): Promise<string> {
  let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  
  if (mimeType === 'application/vnd.google-apps.document') {
    url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Drive Content Error: ${response.status}`);
  }

  return await response.text();
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}
