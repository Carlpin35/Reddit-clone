import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Post, postState, PostVote } from "../atoms/PostAtom";
import { useRouter } from "next/router";
import { firestore, storage, auth } from "../firebase/clientApp";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    where,
    writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { Community, communityState } from "../atoms/communitiesAtom";
import { authModalState } from "../atoms/authModalAtom";
import { useAuthState } from "react-firebase-hooks/auth";

const usePosts = () => {
    const [postStateValue, setPostStateValue] = useRecoilState(postState);
    const [user, loadingUser] = useAuthState(auth);
    const currentCommunity = useRecoilValue(communityState).currentCommunity;
    const setAuthModalState = useSetRecoilState(authModalState);
    const router = useRouter();

    const onVote = async (
        event: React.MouseEvent<SVGElement, MouseEvent>,
        post: Post,
        vote: number,
        communityId: string
    ) => {

        event.stopPropagation();
        //check for user if no user, open auth modal

        if (!user?.uid) {
            setAuthModalState({ open: true, view: "login" });
            return;
        }

        try {
            const { voteStatus } = post;
            const existingVote = postStateValue.postVotes.find(
                (vote) => vote.postId === post.id
            );

            const batch = writeBatch(firestore);
            const updatedPost = { ...post };
            const updatedPosts = [...postStateValue.posts];
            let updatedPostVotes = [...postStateValue.postVotes];
            let voteChange = vote;

            //new Vote
            if (!existingVote) {
                //creating new postVote document
                const postVoteRef = doc(
                    collection(firestore, "users", `${user?.uid}/postVotes`)
                );

                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote, // 1 or -1
                };

                batch.set(postVoteRef, newVote);

                // add or substract 1 from the post.voteStatus
                updatedPost.voteStatus = voteStatus + vote;
                updatedPostVotes = [...updatedPostVotes, newVote];
            }
            // existing Vote - they have voted on the post before
            else {
                const postVoteRef = doc(
                    firestore,
                    "users",
                    `${user?.uid}/postVotes/${existingVote.id}`
                );

                //remove the vote, upvote to neutral OR down to neutral

                if (existingVote.voteValue === vote) {
                    // add or substract 1 from the post.voteStatus
                    updatedPost.voteStatus = voteStatus - vote;
                    updatedPostVotes = updatedPostVotes.filter(
                        (vote) => vote.id !== existingVote.id
                    );

                    //delete the postVote document
                    batch.delete(postVoteRef);

                    voteChange *= -1;
                }
                //flipping the vote from up to down or to down to up
                else {
                    // add or substract 2 from the post.voteStatus

                    updatedPost.voteStatus = voteStatus + 2 * vote;

                    const voteIdx = postStateValue.postVotes.findIndex(
                        (vote) => vote.id === existingVote.id
                    );
                    if (voteIdx !== -1) {
                        updatedPostVotes[voteIdx] = {
                            ...existingVote,
                            voteValue: vote,
                        };
                    }

                    //update the existing postVote document
                    batch.update(postVoteRef, {
                        voteValue: vote,
                    });
                    voteChange = 2 * vote;
                }
            }

            //update state with updated values
            const postIdx = postStateValue.posts.findIndex(
                (item) => item.id === post.id
            );
            updatedPosts[postIdx] = updatedPost;
            setPostStateValue((prev) => ({
                ...prev,
                posts: updatedPosts,
                postVotes: updatedPostVotes,
            }));

            if (postStateValue.selectedPost) {
                setPostStateValue((prev) => ({
                    ...prev,
                    selectedPost: updatedPost,
                }));
            }

            //update our post document
            const postRef = doc(firestore, "posts", post.id!);
            batch.update(postRef, { voteStatus: voteStatus + voteChange });

            await batch.commit();
        } catch (error) {
            console.log("onVote error", error);
        }
    };

    const onSelectPost = (post: Post) => {
        setPostStateValue((prev) => ({
            ...prev,
            selectedPost: post,
        }));
        router.push(`/r/${post.communityId}/comments/${post.id}`);
    };

    const onDeletePost = async (post: Post): Promise<boolean> => {
        try {
            //check fot image and delete it
            if (post.imageURL) {
                const imageRef = ref(storage, `posts/${post.id}/image`);
                await deleteObject(imageRef);
            }
            //delete post.document from firestore
            const postDocRef = doc(firestore, "posts", post.id!);
            await deleteDoc(postDocRef);
            //update recoil state
            setPostStateValue((prev) => ({
                ...prev,
                posts: prev.posts.filter((item) => item.id !== post.id),
            }));

            return true;
        } catch (error) {
            return false;
        }
    };

    const getCommunityPostVotes = async (communityId: string) => {
        const postVotesQuery = query(
            collection(firestore, "users", `${user?.uid}/postVotes`),
            where("communityId", "==", communityId)
        );

        const postVoteDocs = await getDocs(postVotesQuery);
        const postVotes = postVoteDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setPostStateValue((prev) => ({
            ...prev,
            postVotes: postVotes as PostVote[],
        }));
    };

    useEffect(() => {
        if (!user || !currentCommunity?.id) return;
        getCommunityPostVotes(currentCommunity?.id);
    }, [user, currentCommunity]);

    useEffect(() => {
        if (!user) {
            setPostStateValue((prev) => ({
                ...prev,
                postVotes: [],
            }));
        }
    }, [user]);

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onDeletePost,
        onSelectPost,
    };
};
export default usePosts;
