import { doc, onSnapshot } from "firebase/firestore";
import { FIRESTORE_COLLECTIONS } from "../../constants/firestore";
import type { DiagramId } from "../../utils/aiAnalysis";

interface SubscribeToProgressOptions {
  db: import("firebase/firestore").Firestore;
  userId?: string;
  projectId?: string;
  diagrams: DiagramId[];
  onUpdate: (aiAnalysis: Record<string, unknown>) => void;
}

export function subscribeToProgress({
  db,
  userId,
  projectId,
  diagrams,
  onUpdate,
}: SubscribeToProgressOptions): (() => void) | null {
  if (!userId || !projectId || diagrams.length === 0) {
    return null;
  }

  const projectDoc = doc(
    db,
    FIRESTORE_COLLECTIONS.USER_PROJECTS,
    userId,
    FIRESTORE_COLLECTIONS.PROJECTS,
    projectId
  );

  return onSnapshot(projectDoc, (snapshot) => {
    const data = snapshot.data() ?? {};
    const aiAnalysis = (data.aiAnalysis as Record<string, unknown>) || {};
    onUpdate(aiAnalysis);
  });
}
