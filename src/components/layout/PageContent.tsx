import React from 'react'
import { Flex, Box, Icon, Image, Text, Button } from "@chakra-ui/react";


type PageContentProps = {

}

 const PageContent: React.FC<PageContentProps> = ({ children }) => {
	return (
		<Flex justify="center" p="16px 0px">
			<Flex justify="center" maxWidth="860px" width="95%">
			     {/*left side*/}
				<Flex direction="column" width={{ base: "100%", md: "65%"}} mr={{base: 0, md: 6}}>{children && children[0 as keyof typeof children]}</Flex>


			     {/*right side*/}
				<Flex direction="column" display={{base: 'none', md: 'flex'}} flexGrow={1}>{children && children[1 as keyof typeof children]}</Flex>
			</Flex>
		</Flex>
	)
}

export default PageContent