import React, { useEffect, useState } from "react";
import {
	collection,
	doc,
	getDocs,
	onSnapshot,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { firestore, auth } from "../../firebase/clientApp";
import { Community } from "../../atoms/communitiesAtom";
import usePosts from "../../hooks/usePosts";
import { Post } from "../../atoms/PostAtom";
import { useAuthState } from "react-firebase-hooks/auth";
import { Stack, Text } from "@chakra-ui/react";
import PostItem from "./PostItem";
import PostLoader from "./PostLoader";

type PostsProps = {
	communityData?: Community;
};

const Posts: React.FC<PostsProps> = ({ communityData }) => {
	const [user] = useAuthState(auth);
	const [loading, setLoading] = useState(false);
	const {
		postStateValue,
		setPostStateValue,
		onVote,
		onDeletePost,
		onSelectPost,
	} = usePosts();

	const getPosts = async () => {
		try {
			setLoading(true);
			//get posts for community
			const postsQuery = query(
				collection(firestore, "posts"),
				where("communityId", "==", communityData.id),
				orderBy("createdAt", "desc")
			);
			const postsDocs = await getDocs(postsQuery);

			//store in posts State
			const posts = postsDocs.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setPostStateValue((prev) => ({
				...prev,
				posts: posts as Post[],
			}));

			console.log("posts", posts);
		} catch (error) {
			console.log("getPosts error", error.message);
		}
		setLoading(false);
	};

	useEffect(() => {
		getPosts();
	}, [communityData]);

	return (
		<>
			{loading ? (
				<PostLoader />
			) : (
				<Stack>
					{postStateValue.posts.map((item) => (
						<PostItem
							key={item.id}
							post={item}
							userIsCreator={user?.uid === item.creatorId}
							userVoteValue={
								postStateValue.postVotes.find(
									(vote) => vote.postId === item.id
								)?.voteValue
							}
							onVote={onVote}
							onSelectPost={onSelectPost}
							onDeletePost={onDeletePost}
						/>
					))}
				</Stack>
			)}
		</>
	);
};

export default Posts;
