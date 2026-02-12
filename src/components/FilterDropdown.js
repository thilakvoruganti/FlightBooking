import React, { useEffect, useMemo, useState } from 'react'

const FilterDropdown = ({
    className,
    placeholder,
    value,
    options,
    defaultOption,
    onChange,
    onSearch,
    onOpen,
    isInitialLoading = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchOptions, setSearchOptions] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const localFilteredOptions = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase()
        if (!normalized) return options
        return options.filter((element) =>
            [element.city, element.name, element.id].some((field) =>
                String(field || '').toLowerCase().includes(normalized)
            )
        )
    }, [options, searchTerm])

    useEffect(() => {
        let cancelled = false
        const runSearch = async () => {
            const query = searchTerm.trim()
            if (!query || !onSearch) {
                setSearchOptions([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const results = await onSearch(query)
                if (!cancelled) {
                    setSearchOptions(Array.isArray(results) ? results : [])
                }
            } catch (error) {
                if (!cancelled) {
                    setSearchOptions([])
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        const timer = setTimeout(runSearch, 250)
        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [searchTerm, onSearch])

    const showSearchResults = searchTerm.trim().length > 0
    const displayOptions = showSearchResults ? (searchOptions.length ? searchOptions : localFilteredOptions) : options
    const showSkeleton = isInitialLoading && !searchTerm.trim()
    const skeletonItems = [1, 2, 3, 4]

    return (
        <>
            <div className={`dropdown fdd-com`}>
                <div
                    className={`dropdown-toggle ffd-${className}`}
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={onOpen}
                >
                    <div className="fdd-placeholder">{placeholder}</div>
                    <div className="fdd-value">
                        <div className="ffd-displayvalue">{value}</div>
                    </div>
                </div>
                <div className={`dropdown-menu fdd-menu-${className}`}>
                    <div className="fdd-search-wrap" onClick={(event) => event.stopPropagation()}>
                        <input
                            type="text"
                            className="fdd-search-input"
                            placeholder={`Search ${placeholder.toLowerCase()}`}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>
                    {showSkeleton ? (
                        <div className="fdd-skeleton-list">
                            {skeletonItems.map((item) => (
                                <div key={item} className="dd-m-item dd-m-item-skeleton">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="skeleton-line skeleton-line-city"></div>
                                        <div className="skeleton-line skeleton-line-code"></div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="skeleton-line skeleton-line-country"></div>
                                        <div className="skeleton-line skeleton-line-name"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                    {isLoading ? <div className="dd-m-empty">Searching airports...</div> : null}
                    {!isLoading && !showSkeleton && displayOptions.length === 0 ? <div className="dd-m-empty">No airports found</div> : null}
                    {!isLoading && !showSkeleton && displayOptions.map((element) => {
                        return <div key={element.id} className="dd-m-item" onClick={() => {onChange(element)}} data-value={element.city}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-city">{element.city}</div>
                                <div className="d-code">{element.id}</div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-country">
                                    {element.country}
                                </div>
                                <div className="d-name">{element.name}</div>
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </>
    )
}

export default FilterDropdown
