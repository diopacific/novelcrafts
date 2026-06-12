import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, serverTimestamp } from 'firebase/firestore';
import { BibleState, Episode } from '../types';

export function useDbStorage() {
  const { user } = useAuth();
  
  const [bible, setBibleRaw] = useState<BibleState>({
    story: '',
    world: '',
    system: '',
    character: '',
    villain: '',
    structure: ''
  });
  
  const [episodes, setEpisodesRaw] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  // Use refs to track the latest reliable state without re-triggering effects
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      setBibleRaw({
        story: '',
        world: '',
        system: '',
        character: '',
        villain: '',
        structure: ''
      });
      setEpisodesRaw([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadData = async () => {
      try {
        const bibleRef = doc(db, 'users', user.uid, 'bible', 'main');
        const docSnap = await getDoc(bibleRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBibleRaw({
            story: data.story || '',
            world: data.world || '',
            system: data.system || '',
            character: data.character || '',
            villain: data.villain || '',
            structure: data.structure || ''
          });
        }

        const episodesQuery = query(collection(db, 'users', user.uid, 'episodes'));
        const epsSnapshot = await getDocs(episodesQuery);
        const eps: Episode[] = [];
        epsSnapshot.forEach((snap) => {
          const data = snap.data();
          eps.push({
            id: data.id,
            number: data.number,
            direction: data.direction || '',
            content: data.content || '',
            summary: data.summary || '',
          });
        });
        eps.sort((a, b) => a.number - b.number);
        setEpisodesRaw(eps);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [user]);

  const setBible = (newState: BibleState | ((prev: BibleState) => BibleState)) => {
    if (!user) return;
    
    // Support function updates
    const resolvedState = typeof newState === 'function' ? newState(bible) : newState;
    
    // Optimistic update locally
    setBibleRaw(resolvedState);

    // Debounce the firestore writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const bibleRef = doc(db, 'users', user.uid, 'bible', 'main');
      try {
        await setDoc(bibleRef, {
          story: resolvedState.story || '',
          world: resolvedState.world || '',
          system: resolvedState.system || '',
          character: resolvedState.character || '',
          villain: resolvedState.villain || '',
          structure: resolvedState.structure || '',
          ownerId: user.uid,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/bible/main`);
      }
    }, 1000); // 1s debounce
  };

  const setEpisodes = async (newState: Episode[] | ((prev: Episode[]) => Episode[])) => {
    if (!user) return;
    const resolvedState = typeof newState === 'function' ? newState(episodes) : newState;
    const existingIds = new Set(episodes.map(e => e.id));
    const newOrUpdated = resolvedState.filter(e => {
      const existing = episodes.find(x => x.id === e.id);
      return !existing || e.content !== existing.content || e.summary !== existing.summary || e.direction !== existing.direction;
    });

    for (const ep of newOrUpdated) {
      const epRef = doc(db, 'users', user.uid, 'episodes', ep.id);
      try {
        await setDoc(epRef, {
          id: ep.id,
          number: ep.number,
          direction: ep.direction || '',
          content: ep.content || '',
          summary: ep.summary || '',
          ownerId: user.uid,
          createdAt: serverTimestamp()
        });
      } catch (error) {
         handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/episodes/${ep.id}`);
      }
    }
    setEpisodesRaw(resolvedState);
  };

  return { bible, setBible, episodes, setEpisodes, loading };
}
