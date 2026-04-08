'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';

function formatSegment(segment: string) {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function MainHeader() {
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];

  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = formatSegment(segment);
    const isLast = index === segments.length - 1;

    return (
      <BreadcrumbItem key={href}>
        {isLast ? (
          <BreadcrumbPage>{label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );
  });

  return (
    <>
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 ? (
                <BreadcrumbSeparator className="hidden md:block" />
              ) : null}
              {item}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
