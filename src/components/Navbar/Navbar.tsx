import React from "react";
import { Flex, Image } from "@chakra-ui/react";
import SearchInput from "./SearchInput";
import { defaultMenuItem } from '../../atoms/directoryMenuAtom'
import RightContent from "./RightContent/RightContent";
import Directory from "./Directory/Directory";
import { useAuthState } from "react-firebase-hooks/auth";
import useDirectory from '../../hooks/useDirectory'
import { auth } from "../../firebase/clientApp";

const Navbar: React.FC = () => {
	const [user, loading, error] = useAuthState(auth);
	const { onSelectMenuItem } = useDirectory();

	return (
		<div>
			<Flex
				bg="white"
				height="44px"
				padding="6px 12px"
				justify={{ md: "space-between" }}
			>
				<Flex
					align="center"
					width={{ base: "40px", md: "auto" }}
					mr={{ base: 0, md: 2 }}
					cursor="pointer"
					onClick={() => onSelectMenuItem(defaultMenuItem)}
				>
					<Image src="/images/redditFace.svg" height="30px" />
					<Image
						src="/images/redditText.svg"
						height="46px"
						display={{ base: "none", md: "unset" }}
					/>
				</Flex>

				{user && <Directory />}
				<SearchInput user={user} />
				<RightContent user={user} />
			</Flex>
		</div>
	);
};

export default Navbar;
