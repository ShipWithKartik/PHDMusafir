import ImageEditButton from './ImageEditButton';
import { setCategoryCover, deleteCategoryCover, findCategoryCover } from '../services/coverService';

/**
 * In-place editor for a Journal category cover shown on a city page.
 * The admin chooses whether the new image applies to this city only or to
 * the category in every city. "Reset" removes this city's override.
 */
export default function CategoryCoverEditButton({ category, city, covers, currentSrc, style, compact }) {
  const own = findCategoryCover(covers, category, city);

  return (
    <ImageEditButton
      title={`${category} cover — ${city}`}
      currentSrc={currentSrc}
      options={[
        { value: 'city', label: `Only in ${city}` },
        { value: 'all', label: `All cities (default ${category} cover)` },
      ]}
      defaultOption="city"
      onUpload={(file, scope) => setCategoryCover({ category, city: scope === 'all' ? '' : city, file })}
      onReset={own ? () => deleteCategoryCover(own._id) : undefined}
      style={style}
      compact={compact}
    />
  );
}
