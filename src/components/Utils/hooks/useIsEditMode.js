import usePathname from 'components/NextJsMigration/usePathname';
import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';

const useIsEditMode = () => {
    // using a rather complex method to set the search params: https://github.com/vercel/next.js/discussions/47583]
    // since useSearchParams is read-only

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isEditMode = searchParams.get('isEditMode') === 'true';

    const toggleIsEditMode = () => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('isEditMode', !isEditMode);
        const search = current.toString();
        const query = search ? `?${search}` : '';
        router.push(`${pathname}${query}`);
    };
    return { isEditMode, toggleIsEditMode };
};

export default useIsEditMode;
