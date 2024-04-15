import React, {
    useState,
    useEffect,
    MouseEvent,
    useContext,
    useMemo,
} from "react";
import { Message, OutgoingSearchResult } from "../types/types";
import Markdown from "react-markdown";
import { APIClientContext } from "../context/AdvisorClientContext";

interface MessageProps {
    onContextMenuClick: (messageId: string, action: string) => void; // Define the prop type
    message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({
    message,
    onContextMenuClick,
}) => {
    const {
        availableTools,
        getToolRunResultsForMessage,
        setIngredientForHover,
    } = useContext(APIClientContext);

    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const memoizedMarkdown = useMemo(
        () => (
            <Markdown
                components={{
                    img: ({ node, ...props }) => (
                        <img
                            className="rounded-full w-8 h-8 inline-block mr-1"
                            alt=""
                            {...props}
                        />
                    ),
                    a: ({ node, ...props }) => (
                        <a
                            className="text-blue-500 underline"
                            target="_blank"
                            onMouseEnter={(
                                event: MouseEvent<HTMLAnchorElement>
                            ) => {
                                onTipHover(
                                    event,
                                    props.children?.toString() || ""
                                );
                            }}
                            onMouseLeave={onTipExit}
                            rel="noreferrer"
                            {...props}
                        >
                            {props.children}
                        </a>
                    ),
                    p: ({ node, ...props }) => (
                        <p className="pt-2" {...props}>
                            {props.children}
                        </p>
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-4" {...props}>
                            {props.children}
                        </ul>
                    ),
                    h1: ({ node, ...props }) => (
                        <h1 className="text-4xl font-bold pt-6 pb-2" {...props}>
                            {props.children}
                        </h1>
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-3xl font-bold pt-4 pb-2" {...props}>
                            {props.children}
                        </h2>
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-2xl font-bold pt-4 pb-2" {...props}>
                            {props.children}
                        </h3>
                    ),
                    h4: ({ node, ...props }) => (
                        <h4
                            className="text-xl font-bold pt-4 pb-2 underline-offset-2 underline"
                            {...props}
                        >
                            {props.children}
                        </h4>
                    ),
                    h5: ({ node, ...props }) => (
                        <h5 className="text-lg font-bold pt-4 pb-2" {...props}>
                            {props.children}
                        </h5>
                    ),
                    h6: ({ node, ...props }) => (
                        <h6
                            className="text-base font-bold pt-4 pb-2"
                            {...props}
                        >
                            {props.children}
                        </h6>
                    ),
                }}
            >
                {message.content}
            </Markdown>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [message.content]
    );

    function onTipHover(event: MouseEvent<HTMLAnchorElement>, name: string) {
        let mc = getToolRunResultsForMessage(message.id);
        let mcw = mc.find((m) => m.messageId === message.id);
        if (!mcw) return;
        const ingredient = (mcw.content as OutgoingSearchResult[]).find(
            (item) => item.ingredientName === name
        ) as OutgoingSearchResult;
        if (ingredient === undefined) return;
        setIngredientForHover(ingredient, event.clientX, event.clientY);
    }
    function onTipExit(event: MouseEvent<HTMLAnchorElement>) {
        setIngredientForHover(null, 0, 0);
    }

    // Close menu when clicking outside
    useEffect(() => {
        const closeMenu = (event: any) => {
            if (
                event.target &&
                !(event.target as HTMLElement).closest(".context-menu")
            ) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener("click", closeMenu);
        }
        return () => {
            document.removeEventListener("click", closeMenu);
        };
    }, [showMenu]);

    const handleContextMenuItemClick = (action: string) => {
        // Call the passed function with the message ID and the selected action
        onContextMenuClick(message.id, action);
        setShowMenu(false);
    };

    const handleRightClick = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setShowMenu(!showMenu);
    };

    const messageBubbleStyle = `max-w-[60%] min-w-[20%] md:max-w-[40%] px-4 py-2 rounded-lg shadow text-start ${
        message.type === "advisor-message" || message.type === "system-message"
            ? "bg-gray-50 text-gray-700"
            : "bg-indigo-600 text-white"
    }`;

    const filteredTools = availableTools?.filter(
        (tool) => tool.type === message.type
    );

    return (
        <div
            className={`flex m-2 ${
                message.type === "advisor-message" ||
                message.type === "system-message"
                    ? "justify-start"
                    : "justify-end"
            }`}
            onContextMenu={handleRightClick}
        >
            <div className={messageBubbleStyle}>{memoizedMarkdown}</div>
            {showMenu && (
                <ul
                    className="context-menu absolute bg-white shadow-lg rounded-lg p-1 z-10 w-56 flex flex-col justify-start items-start"
                    style={{
                        position: "fixed",
                        left: menuPosition.x,
                        top: menuPosition.y,
                    }}
                >
                    {filteredTools && filteredTools.length > 0 ? (
                        filteredTools.map((tool, index) => (
                            <li
                                key={tool.name}
                                className={`self-stretch px-4 py-2 justify-start items-center inline-flex 
                                            ${
                                                getToolRunResultsForMessage(
                                                    message.id
                                                ).filter(
                                                    (result) =>
                                                        result.toolName ===
                                                        tool.name
                                                ).length > 0
                                                    ? "grayscale opacity-50 cursor-not-allowed"
                                                    : "hover:bg-gray-100 hover:cursor-pointer"
                                            }`}
                                onClick={(event) =>
                                    handleContextMenuItemClick(tool.name)
                                }
                            >
                                <div className="text-gray-700 text-sm font-normal font-sans leading-tight">
                                    {tool.displayName}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="self-stretch px-4 py-2 justify-start items-center inline-flex">
                            <div className="text-gray-700 text-sm font-normal font-sans leading-tight">
                                Empty
                            </div>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default MessageComponent;
