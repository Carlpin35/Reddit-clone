import { atom } from 'recoil';
import { Timestamp } from 'firebase/firestore';

export interface Community {
	id: string;
	creatorId: string;
	numberOfMembers: number;
	privacyType: 'public' | 'restricted' | 'private';
	createdAt?: Timestamp;
	imageURL?: string;
}

 export interface CommunitySnippet {
 	communityId: string;
 	isModerator?: boolean;
 	imageURL?: string;
 }

interface CommunityState {
	mySnippets: CommunitySnippet[];
	currentCommunity: Community;
	snippetsFetched: boolean;
}

export const defaultCommunity: Community = {
  id: "",
  creatorId: "",
  numberOfMembers: 0,
  privacyType: "public",
};


 const defaultCommunityState: CommunityState = {
 	mySnippets: [],
 	snippetsFetched: false,
 	currentCommunity: defaultCommunity,
 } 

export const communityState = atom<CommunityState>({
	key: 'communityState',
    default: defaultCommunityState,
}) 