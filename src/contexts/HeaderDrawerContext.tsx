import React, {createContext, useContext, useState, ReactNode} from 'react'

interface HeaderDrawerContextType {
	drawerContent: ReactNode | null
	setDrawerContent: (content: ReactNode | null) => void
}

const HeaderDrawerContext = createContext<HeaderDrawerContextType | undefined>(
	undefined
)

export const HeaderDrawerProvider: React.FC<{children: ReactNode}> = ({
	children,
}) => {
	const [drawerContent, setDrawerContent] = useState<ReactNode | null>(null)

	return (
		<HeaderDrawerContext.Provider value={{drawerContent, setDrawerContent}}>
			{children}
		</HeaderDrawerContext.Provider>
	)
}

export const useHeaderDrawer = () => {
	const context = useContext(HeaderDrawerContext)
	if (context === undefined) {
		throw new Error(
			'useHeaderDrawer must be used within a HeaderDrawerProvider'
		)
	}
	return context
}
