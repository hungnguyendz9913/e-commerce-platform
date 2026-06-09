# Categories Specification

## Purpose

Define product category listing, visibility, hierarchy, and product relationship behavior.

## Requirements

### Requirement: Public category listing
The system SHALL expose active categories for public browsing.

#### Scenario: List active categories
- GIVEN active and inactive categories exist
- WHEN `GET /categories` is called
- THEN the system returns active categories
- AND excludes inactive categories from public navigation.

### Requirement: Category hierarchy
The system SHALL support parent-child category relationships.

#### Scenario: Nested category returned
- GIVEN categories have parent and child relationships
- WHEN categories are listed
- THEN the system includes enough hierarchy data for storefront navigation.

### Requirement: Category-product relationship
The system SHALL associate each product with a category.

#### Scenario: Filter products by category
- GIVEN active approved products exist in a category
- WHEN a user filters products by `categoryId`
- THEN the system returns visible products in that category according to product visibility rules.

### Requirement: Unique category slug
The system SHALL require unique category slugs.

#### Scenario: Duplicate category slug
- GIVEN a category already uses a slug
- WHEN another category is created or updated with the same slug
- THEN the system rejects the request with a conflict error.
