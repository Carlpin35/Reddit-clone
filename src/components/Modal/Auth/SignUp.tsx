import React, { useState, useEffect } from "react";
import { Input, Button, Flex, Text } from "@chakra-ui/react";
import { useSetRecoilState } from "recoil";
import { authModalState, ModalView } from "../../../atoms/authModalAtom";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/clientApp";
import { User } from 'firebase/auth'
import { FIREBASE_ERRORS } from "../../../firebase/errors";
import { firestore } from '../../../firebase/clientApp';
import { setDoc, collection, doc  } from 'firebase/firestore';

type SignUpProps = {
  toggleView: (view: ModalView) => void;
};

const SignUp: React.FC<SignUpProps> = ({ toggleView }) => {
	const setAuthModalState = useSetRecoilState(authModalState);
	const [signUpForm, setSignUpForm] = useState({
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [error, setError] = useState("");

	const [createUserWithEmailAndPassword, userCred, loading, userError] =
		useCreateUserWithEmailAndPassword(auth);

	//Firebase
	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (error) setError("");
		if (signUpForm.password !== signUpForm.confirmPassword) {
			setError("Passwords do not match ");
			return;
		}

		createUserWithEmailAndPassword(signUpForm.email, signUpForm.password);
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		//update login form
		setSignUpForm((prev) => ({
			...prev,
			[event.target.name]: event.target.value,
		}));
	};

	const createUserDocument = async  (user: User) => {
		await setDoc(
      doc(firestore, "users", user.uid),
      JSON.parse(JSON.stringify(user))
    );
	};

	useEffect(() => {
	   if (userCred) {
	   	createUserDocument(userCred.user);
	   }
	}, [userCred])

	return (
		<form onSubmit={onSubmit}>
			<Input
				required
				name="email"
				placeholder="email"
				type="email"
				mb={2}
				onChange={onChange}
				fontSize="10pt"
				_placeholder={{ color: "gray.500" }}
				_hover={{
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				_focus={{
					outline: "none",
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				bg="gray.50"
			/>

			<Input
				required
				name="password"
				placeholder="password"
				type="password"
				onChange={onChange}
				fontSize="10pt"
				_placeholder={{ color: "gray.500" }}
				_hover={{
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				_focus={{
					outline: "none",
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				bg="gray.50"
			/>
			{/*confirm password*/}
			<Input
				required
				name="confirmPassword"
				placeholder="Confirm password"
				type="password"
				onChange={onChange}
				fontSize="10pt"
				_placeholder={{ color: "gray.500" }}
				_hover={{
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				_focus={{
					outline: "none",
					bg: "white",
					border: "1px solid",
					borderColor: "blue.500",
				}}
				bg="gray.50"
			/>
                   
			      <Text textAlign="center" color="red" fontSize="10pt">
				        {error || FIREBASE_ERRORS[userError?.message as keyof typeof FIREBASE_ERRORS] }
			       </Text>
                   

			<Button 
			    type="submit" 
			    width="100%" 
			    height="36px" 
			    mt={2} 
			    mb={2} 
			    isLoading={loading}
			>
				Sign Up
			</Button>

			<Flex fontSize="9pt" justifyContent="center">
				<Text mr={1}>Already a Redditor?</Text>
				<Text
					color="blue.500"
					fontWeight={700}
					cursor="pointer"
					onClick={() => toggleView("login")}
				  >
					LOG IN
				</Text>
			</Flex>
		</form>
	);
};

export default SignUp;
