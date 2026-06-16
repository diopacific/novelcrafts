import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const envConfig = import.meta.env.VITE_FIREBASE_API_KEY ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)',
} : null;

const activeConfig = envConfig || firebaseConfig;

const app = initializeApp(activeConfig);
export const db = getFirestore(app, activeConfig.firestoreDatabaseId); // CRITICAL
export const auth = getAuth();

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      const currentDomain = window.location.hostname;
      alert(`[통신 차단됨] 현재 도메인(${currentDomain})이 Firebase에 등록되지 않았습니다.\n\n해결 방법:\n1. 파이어베이스 콘솔(Firebase Console) 접속\n2. Authentication(인증) -> Settings(설정) -> Authorized domains(승인된 도메인) 이동\n3. '${currentDomain}' 를 추가해주세요.`);
      throw error;
    } else if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      alert("팝업이 차단되었거나 닫혔습니다. 로그인 창이 뜨지 않는다면 팝업 차단을 해제해주세요.");
      throw error;
    } else {
      console.error("Login failed", error);
      throw error;
    }
  }
}

export async function logout() {
  return signOut(auth);
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Error handling standard from skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
