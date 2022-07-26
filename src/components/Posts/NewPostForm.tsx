import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import { Flex, Box, Icon, Image, Text, Button } from "@chakra-ui/react";
import { Alert, AlertIcon } from "@chakra-ui/react";
import { BiPoll } from "react-icons/bi";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import useSelectFile from "../../hooks/useSelectFile";
import { AiFillCloseCircle } from "react-icons/ai";
import TabItem from "./TabItem";
import TextInputs from "./PostForm/TextInputs";
import ImageUpload from "./PostForm/ImageUpload";
import { firestore, storage } from "../../firebase/clientApp";
import {
	addDoc,
	collection,
	doc,
	serverTimestamp,
	Timestamp,
	updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { User } from "firebase/auth";
import { Post } from "../../atoms/PostAtom";

type NewPostFormProps = {
	user: User;
	communityImageURL?: string;
	communityId: string;
};

const formTabs: TabItem[] = [
	{
		title: "Post",
		icon: IoDocumentText,
	},
	{
		title: "Images & Video",
		icon: IoImageOutline,
	},
	{
		title: "Link",
		icon: BsLink45Deg,
	},
	{
		title: "Poll",
		icon: BiPoll,
	},
	{
		title: "Talk",
		icon: BsMic,
	},
];

export type TabItem = {
	title: string;
	icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({ user, communityImageURL, communityId }) => {
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
	const [textInputs, setTextInputs] = useState({
		title: "",
		body: "",
	});
	//const [selectedFile, setSelectedFile] = useState<string>();
	const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	const handleCreatePost = async () => {
		const { communityId } = router.query;
		//create new post object type => post
		const newPost: Post = {
			communityId: communityId as string,
			communityImageURL: communityImageURL || '',
			creatorId: user?.uid,
			creatorDisplayName: user.email!.split("@")[0],
			title: textInputs.title,
			body: textInputs.body,
			numberOfComments: 0,
			voteStatus: 0,
			createdAt: serverTimestamp() as Timestamp,
		};

		setLoading(true);
		try {
			//store the post in db
			const postDocRef = await addDoc(
				collection(firestore, "posts"),
				newPost
			);

			//check for selectedFile
			if (selectedFile) {
				//store in storage => getDownloadURL (return imageURL)
				const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
				await uploadString(imageRef, selectedFile, "data_url");
				const downloadURL = await getDownloadURL(imageRef);
				//update post by adding imageUrl
				await updateDoc(postDocRef, {
					imageURL: downloadURL,
				});
			}
			//redirect user to community page using route
		  router.back();
		} catch (error: any) {
			console.log("handleCreatePost error", error.message);
			setError(true);
		}
		setLoading(false);
		
	};

	/*const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log("this is happening", event);
		const reader = new FileReader();

		if (event.target.files?.[0]) {
			reader.readAsDataURL(event.target.files[0]);
		}

		reader.onload = (readerEvent) => {
			if (readerEvent.target?.result) {
				setSelectedFile(readerEvent.target.result as string);
			}
		};
	};*/

	const onTextChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const {
			target: { name, value },
		} = event;
		setTextInputs((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<Flex direction="column" bg="white" borderRadius={4} mt={2}>
			<Flex width="100%">
				{formTabs.map((item) => (
					<TabItem
						key={item.title}
						item={item}
						selected={item.title === selectedTab}
						setSelectedTab={setSelectedTab}
					/>
				))}
			</Flex>
			<Flex p={4}>
				{selectedTab === "Post" && (
					<TextInputs
						textInputs={textInputs}
						handleCreatePost={handleCreatePost}
						onChange={onTextChange}
						loading={loading}
					/>
				)}
				{selectedTab === "Images & Video" && (
					<ImageUpload
						selectedFile={selectedFile}
						onSelectImage={onSelectFile}
						setSelectedTab={setSelectedTab}
						setSelectedFile={setSelectedFile}
					/>
				)}
			</Flex>
			{error && (
				<Alert status="error">
					<AlertIcon />
					<Text>Error creating Post</Text>
				</Alert>
			)}
		</Flex>
	);
};
export default NewPostForm;
