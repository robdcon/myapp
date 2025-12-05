import { useDisplayUncheckedItems } from '../api/display-unchecked-items';

interface Item {
    id: string;
    name: string;
}

interface BoardData {
    board: {
        items: Item[];
    };
}

interface UncheckedItemsData {
    uncheckedItems: Item[];
}

export const UncheckedItemsList = ({boardId}: {boardId: string}) => {

    const { data, loading, error } = useDisplayUncheckedItems(boardId) as { data: UncheckedItemsData | undefined, loading: boolean, error: any };
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    
    if (!data?.uncheckedItems?.length) {
        return <div>No unchecked items found.</div>;
    }
    
    return (
        <div>
            <ul>
                {data.uncheckedItems.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
}