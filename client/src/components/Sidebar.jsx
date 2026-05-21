import CategoryList from './CategoryList';

export default function Sidebar({ categories }) {
  return (
    <aside className="lg:sticky lg:top-24 flex flex-col gap-5">
      <CategoryList
        title="Categories"
        items={categories}
      />
    </aside>
  );
}

