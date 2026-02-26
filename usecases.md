const resourceText =
        t(`resourceType.${resourceType}`, { count: 2 }) || resourceType


res[locality].push({
              count,
              resourceType: resourceCounters.type,
              text: `${count} ${
                t(`resourceType.${resourceCounters.type}`, { count }) ||
                resourceCounters.type
              }`,
            })


{t(
            hasError
              ? 'searchbar.api_unavailable.content'
              : 'searchbar.no_results.content',
          )}


            <Button
              key={filter.id}
              onClick={() => {
                onChangeFilter(index)
              }}
              sentiment="primary"
              size="xsmall"
              variant={filter.selected ? 'filled' : 'outlined'}
            >
              {t(`searchbar.${filter.id}`, { count: counts[filter.id] ?? 0 })}
            </Button>



const text =
                  t(`resourceType.${resourceType}`, { count: value }) ||
                  resourceType


        label={
          hasErrors
            ? scopedT(`step.${step !== 0 ? step : '1'}.error`)
            : scopedT(`step.${step !== 0 ? step : '1'}`)
        }
