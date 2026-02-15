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
    throw new Error('Missing Google Client ID. Click the gear icon to set it up.');
  }

  // Basic format check for Client ID
  if (!CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
    throw new Error('Invalid Client ID format. It should end with ".apps.googleusercontent.com"');
  }

  return new Promise((resolve, reject) => {
    try {
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services not loaded. Please check your internet connection and refresh.');
      }

      console.debug('Requesting OAuth token for origin:', window.location.origin);

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (response: any) => {
          if (response.error !== undefined) {
            const errorMsg = response.error_description || response.error;
            console.error('OAuth Response Error:', response);
            reject(new Error(`Google Login Error: ${errorMsg}`));
            return;
          }
          
          const accessToken = response.access_token;
          
          if (!window.gapi) {
             reject(new Error('Google API Client (gapi) failed to load.'));
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
                      const fileId = file.id;
                      const mimeType = file.mimeType;
                      
                      try {
                        const content = await fetchFileContent(fileId, mimeType, accessToken);
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
                reject(new Error(`Picker creation failed: ${pickerErr.message}`));
              }
            }
          });
        },
      });

      // Request token via popup
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error: any) {
      console.error('PickFile Logic Error:', error);
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
    if (response.status === 403) {
      throw new Error('Access denied. Is the Drive API enabled in your project?');
    }
    throw new Error(`Google API Error: ${response.statusText} (${response.status})`);
  }

  return await response.text();
}

declare global {
  interface Window {
    google: any;
    gapi: any;
    process: any;
  }
}
