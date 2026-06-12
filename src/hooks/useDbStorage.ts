import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, serverTimestamp } from 'firebase/firestore';
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

    const bibleRef = doc(db, 'users', user.uid, 'bible', 'main');
    const unsubBible = onSnapshot(bibleRef, (docSnap) => {
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
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/bible/main`);
    });

    const episodesQuery = query(collection(db, 'users', user.uid, 'episodes'));
    const unsubEpisodes = onSnapshot(episodesQuery, (snapshot) => {
      const eps: Episode[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        eps.push({
          id: data.id,
          number: data.number,
          direction: data.direction,
          content: data.content,
          summary: data.summary
        });
      });
      eps.sort((a, b) => a.number - b.number);
      setEpisodesRaw(eps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/episodes`);
    });

    return () => {
      unsubBible();
      unsubEpisodes();
    };

  }, [user]);

  const setBible = async (newState: BibleState | ((prev: BibleState) => BibleState)) => {
    if (!user) return;
    
    // Support function updates
    const resolvedState = typeof newState === 'function' ? newState(bible) : newState;
    
    // Optistic update locally
    setBibleRaw(resolvedState);

    const bibleRef = doc(db, 'users', user.uid, 'bible', 'main');
    try {
      await setDoc(bibleRef, {
        ...resolvedState,
        ownerId: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/bible/main`);
    }
  };

  const setEpisodes = async (newState: Episode[] | ((prev: Episode[]) => Episode[])) => {
    if (!user) return;
    
    const resolvedState = typeof newState === 'function' ? newState(episodes) : newState;
    
    // Diff to find what to save. Since we only ever *add* or *update* an episode from workspace:
    // We should ideally sync the latest or all of them.
    // To be safe and simple for this prototype, whenever setEpisodes changes, we ensure all are saved.
    // But setting all documents separately can be costly. Let's just find the one that changed.
    // Or normally we'd write a function to just `addEpisode`. But to match `useLocalStorage`, we just diff.
    
    // Find newly added episode or updated episode
    // Only dealing with adding new ones for now as per workspace standard usage:
    // setEpisodes(prev => [...prev, newEpisode])
    const existingIds = new Set(episodes.map(e => e.id));
    const newOrUpdated = resolvedState.filter(e => !existingIds.has(e.id) || e.content !== episodes.find(x => x.id === e.id)?.content);

    for (const ep of newOrUpdated) {
      const epRef = doc(db, 'users', user.uid, 'episodes', ep.id);
      try {
        await setDoc(epRef, {
          ...ep,
          ownerId: user.uid,
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
         handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/episodes/${ep.id}`);
      }
    }
    
    // Optimistic local update not strictly needed as snapshot listener will fire,
    // but React setState is expected to be synchronous for local components.
    // The snapshot will just overwrite it with the same data.
    setEpisodesRaw(resolvedState);
  };

  return { bible, setBible, episodes, setEpisodes, loading };
}
