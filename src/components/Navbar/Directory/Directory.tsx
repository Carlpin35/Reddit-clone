import React from "react";
import {
	Menu,
	MenuButton,
	MenuList,
	MenuDivider,
	MenuItem,
	Button,
	Text,
	Flex,
	Icon,
	Image
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { TiHome } from "react-icons/ti";
import useDirectory from "../../../hooks/useDirectory";
import Communities from "./Communities";

const Directory: React.FC = () => {
	const { directoryState, toggleMenuOpen } = useDirectory();

	return (
		<Menu isOpen={directoryState.isOpen}>
			<MenuButton
				cursor="pointer"
				padding="8px 6px"
				borderRadius={4}
				_hover={{ outline: "1px solid", outlineColor: "gray.200" }}
				mr={2}
				ml={{ base: 1, md: 2 }}
				onClick={toggleMenuOpen}
			>
				<Flex
					align="center"
					justify="space-between"
					width={{ base: "auto", lg: "200px" }}
				>
					<Flex align="center">
					{directoryState.selectedMenuItem.imageURL ? (
                           <Image src={directoryState.selectedMenuItem.imageURL} borderRadius="full" boxSize="24px" mr={2} />
						) : (
                          <Icon
							as={directoryState.selectedMenuItem.icon}
							fontSize={24}
							mr={{ base: 1, md: 2 }}
							color={directoryState.selectedMenuItem.iconColor}
						/>
						)}
						
						<Flex
							align="center"
							display={{ base: "none", lg: "flex" }}
						>
							<Text fontWeight={600} fontSize="10pt">
								{directoryState.selectedMenuItem.displayText}
							</Text>
						</Flex>
					</Flex>
					<ChevronDownIcon />
				</Flex>
			</MenuButton>
			<MenuList>
				<Communities />
			</MenuList>
		</Menu>
	);
};
export default Directory;
