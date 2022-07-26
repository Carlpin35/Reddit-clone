import React, { useRef, useState } from "react";
import Link from "next/link";
import { Community } from "../../atoms/communitiesAtom";
import {
	Flex,
	Icon,
	Button,
	Divider,
	Box,
	Stack,
	Text,
	Image,
	Spinner
} from "@chakra-ui/react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import { auth, storage, firestore } from "../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { FaReddit } from 'react-icons/fa'
import  useSelectFile  from '../../hooks/useSelectFile';
import { updateDoc, doc } from 'firebase/firestore';
import { Community, communityState } from "../../atoms/communitiesAtom";
import { useSetRecoilState } from "recoil";
import moment from "moment";

type AboutProps = {
	communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
	const [user] = useAuthState(auth);
	const [uploadingImage, setUploadingImage] = useState(false);
	const selectedFileRef = useRef<HTMLInputElement>(null);
	const setCommunityStateValue = useSetRecoilState(communityState);
	const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
	

	const onUpdateImage = async () => {
         if (!selectedFile) return;
          setUploadingImage(true);
         try {
          const imageRef = ref(storage, `communities/${communityData.id}/image`);
          await uploadString(imageRef, selectedFile, "data_url");
          const downloadURL = await getDownloadURL(imageRef);
          await updateDoc(doc(firestore, 'communities', communityData.id), {
          	imageURL: downloadURL,
          });
            
            setCommunityStateValue((prev) => ({
            	...prev, 
            	currentCommunity: {
            		...prev.currentCommunity,
            		imageURL: downloadURL
            	} as Community,
            }))
              
         } catch (error) {
         	console.log("onUpdateImage error", error);
         }
          setUploadingImage(false);
	};

	return (
		<Box position="sticky" top="14px">
			<Flex
				justify="space-between"
				align="center"
				bg="blue.500"
				color="white"
				p={3}
				borderRadius="4px 4px 0px 0px"
			>
				<Text fontSize="10pt" fontWeight={700}>
					About Community
				</Text>
				<Icon as={HiOutlineDotsHorizontal} />
			</Flex>

			<Flex
				direction="column"
				p={3}
				bg="white"
				borderRadius="0px 0px 4px 4px"
			>
				<Stack>
					<Flex width="100%" p={2} fontSize="10pt">
						<Flex direction="column" flexGrow={1} fontWeight={700}>
							<Text>
								{communityData.numberOfMembers.toLocaleString()}
							</Text>
							<Text>Members</Text>
						</Flex>
						<Flex direction="column" flexGrow={1}>
							<Text>1</Text>
							<Text>Online</Text>
						</Flex>
					</Flex>
					<Divider />

					<Flex
						align="center"
						width="100%"
						p={1}
						fontWeight={500}
						fontSize="10pt"
					>
						<Icon as={RiCakeLine} fontSize={18} mr={2} />
						{communityData.createdAt && (
							<Text>
								Created{" "}
								{moment(
									new Date(
										communityData.createdAt.seconds * 1000
									)
								).format("MMM DD, YYYY")}
							</Text>
						)}
					</Flex>
					<Link href={`/r/${communityData.id}/submit`}>
						<Button mt={3} height="30px">
							Create Post
						</Button>
					</Link>

					{user?.uid === communityData.creatorId && (
						<>
							<Divider />
							<Stack spacing={1} fontSize="10pt">
								<Text fontWeight={600}>Admin</Text>
								<Flex align="center" justify="space-between">
									<Text
										color="blue.500"
										cursor="pointer"
										_hover={{ textDecoration: "underline" }}
										onClick={() => selectedFileRef.current?.click()}
									>
										Change Image
									</Text>
									{communityData.imageURL || selectedFile ? (
                                        <Image src={selectedFile || communityData.imageURL} borderRadius="full" boxSize="40px" alt="community image" />
										) : (
                                          <Icon as={FaReddit} fontSize={40} color="brand.100" mr={2} />
										)}
								</Flex>
								{selectedFile &&  (
                                   uploadingImage ? ( <Spinner /> ) : ( <Text cursor="pointer" onClick={onUpdateImage} >Save Changes</Text> )
                                   )}
								  <input
					              	ref={selectedFileRef}
					              	hidden
					              	type="file"
					              	onChange={onSelectFile}
					              />
							</Stack>
						</>
					)}
				</Stack>
			</Flex>
		</Box>
	);
};
export default About;
