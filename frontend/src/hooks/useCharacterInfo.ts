import { useState, useEffect, useCallback } from 'react';

interface CharacterInfo {
  characterId: string;
  characterName: string;
}

export function useCharacterInfo() {
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacterInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/js-api/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch character information');
      }

      const data = await response.json();
      setCharacterInfo(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load character information');
      setCharacterInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacterInfo();
  }, [fetchCharacterInfo]);

  return { characterInfo, isLoading, error, refetch: fetchCharacterInfo };
} 