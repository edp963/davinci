import React, { lazy, Suspense } from 'react'

function loadable<P extends React.ComponentType<any>> (importFunc: () => Promise<{default: P}>, { fallback = null } = { fallback: null }) {
  const LazyComponent = lazy<P>(importFunc)

  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

export default loadable
