import React, { useEffect } from "react";
import {
	Button,
	useDisclosure,
	Modal,
	ModalOverlay,
	ModalFooter,
	ModalBody,
	ModalHeader,
	ModalContent,
	ModalCloseButton,
} from "@chakra-ui/react";
import { useRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { Flex, Text } from "@chakra-ui/react";
import AuthInputs from "./AuthInputs";
import OAuthButtons from "./OAuthButtons";
import ResetPassword from './ResetPassword'
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/clientApp";

const AuthModal: React.FC = () => {
	const [modalState, setModalState] = useRecoilState(authModalState);
	const [user, loading, error] = useAuthState(auth);

	const handleClose = () => {
		setModalState((prev) => ({
			...prev,
			open: false,
		}));
	};

	const toggleView = (view: string) => {
    setModalState({
      ...modalState,
      view: view as typeof modalState.view,
    });
  };

	useEffect(() => {
		if (user) handleClose();
	}, [user]);

	return (
		<>
			<Modal isOpen={modalState.open} onClose={handleClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader textAlign="center">
						{modalState.view === "login" && "Login"}
						{modalState.view === "signup" && "Sign Up"}
						{modalState.view === "resetPassword" &&
							"Reset Password"}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						pb={6}
					>
						<Flex
							direction="column"
							align="center"
							justify="center"
							width="70%"
						>
							{modalState.view === "login" ||
							modalState.view === "signup" ? (
								<>
									<OAuthButtons />
									<Text color="gray.500" fontWeight={700}>
										OR
									</Text>
									<AuthInputs toggleView={toggleView} />
								</>
							) : (
								<ResetPassword toggleView={toggleView} />
							)}
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default AuthModal;
