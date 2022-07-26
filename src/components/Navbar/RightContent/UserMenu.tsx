import React from "react";
import {
	Menu,
	MenuButton,
	MenuList,
	MenuDivider,
	MenuItem,
	Button,
	Flex,
	Icon,
} from "@chakra-ui/react";
import { FaRedditSquare } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { CgProfile } from "react-icons/cg";
import { IoSparkles } from "react-icons/io5";
import { MdOutlineLogin } from "react-icons/md";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { auth } from "../../../firebase/clientApp";
import { signOut, User } from "firebase/auth";
import { useSetRecoilState, useResetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { communityState } from '../../../atoms/communitiesAtom'

type UserMenuProps = {
	user?: User | null;
};

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
	const setAuthModalState = useSetRecoilState(authModalState);

	const logout = async () => {
	 await signOut(auth); 
	 //clear community state
	}

	return (
		<Menu>
			<MenuButton
				cursor="pointer"
				padding="8px 6px"
				borderRadius={4}
				_hover={{ outline: "1px solid", outlineColor: "gray.200" }}
			>
					<Flex align="center">
						<Flex align="center">

				{user ? (

							<>
								<Icon
									as={FaRedditSquare}
									mr={1}
									fontSize={24}
									color="gray.300"
								/>
							</>
						
				) : (
					<Icon
						as={VscAccount}
						fontSize={24}
						color="gray.400"
						mr={1}
					/>
				)}
						</Flex>
						<ChevronDownIcon />
					</Flex>
			</MenuButton>
			<MenuList>
                 {user ? (
                 	  <>
                 	  <MenuItem
					fontSize="10pt"
					fontWeight={700}
					_hover={{ bg: "blue.500", color: "white" }}
				>
					<Flex align="center">
						<Icon as={CgProfile} fontSize={20} mr={2} />
						Profile
					</Flex>
				</MenuItem>

				<MenuDivider />

				<MenuItem
					onClick={logout}
					fontSize="10pt"
					fontWeight={700}
					_hover={{ bg: "blue.500", color: "white" }}
				>
					<Flex align="center">
						<Icon as={MdOutlineLogin} fontSize={20} mr={2} />
						Log Out
					</Flex>
				</MenuItem>	
                 	  </>
                 	) : (
                     <>
                     <MenuItem
					onClick={() => setAuthModalState({ open: true, view: "login" })}
					fontSize="10pt"
					fontWeight={700}
					_hover={{ bg: "blue.500", color: "white" }}
				>
					<Flex align="center">
						<Icon as={MdOutlineLogin} fontSize={20} mr={2} />
						Log In / Sign Up
					</Flex>
				</MenuItem>		
                     </>
                 	)}

				
			</MenuList>
		</Menu>
	);
};
export default UserMenu;
