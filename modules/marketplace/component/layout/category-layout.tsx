import Breadcrumbs from '../../../../components/Breadcrumbs';
import MainLayout from '../../../../components/Layout/MainLayout';
import CategoriesNav from '../CategoriesNav/CategoriesNav';
import { categoryMenus } from './data/category-data';

interface LayoutProps extends React.ComponentPropsWithRef<'section'> {
  children: React.ReactNode;
}

const CategoryLayout = ({ children, ...props }: LayoutProps) => {
  return (
    <MainLayout activePage="marketplace" showDashboardSidebar={false} showFooter={true} showTopbar={true}>
      <div className="max-w-[1240px] mx-auto pt-5 px-5 md:px-0">
        <CategoriesNav navItems={categoryMenus} />
        <div className="my-4 md:my-6 lg:my-8">
          <Breadcrumbs />
        </div>
        <section {...props}>{children}</section>
      </div>
    </MainLayout>
  );
};

export default CategoryLayout;
